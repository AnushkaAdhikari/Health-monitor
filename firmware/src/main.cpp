#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"
#include <OneWire.h>
#include <DallasTemperature.h>

// ─── Config ──────────────────────────────────────────────────────────────────
const char* WIFI_SSID     = "iPhone";
const char* WIFI_PASS     = "123456789";
// Use this computer's IPv4 address and keep port 8000 for the FastAPI server.
// Both the ESP32 and this computer must be connected to the same Wi-Fi network.
const char* API_ENDPOINT  = "http://172.20.10.3:8000/api/vitals/";
const int   PATIENT_ID    = 3;

// ─── Finger detection threshold ──────────────────────────────────────────────
const long IR_FINGER_THRESHOLD = 50000;

// ─── Pin Definitions ─────────────────────────────────────────────────────────
#define DS18B20_PIN 4
#define SDA_PIN     21
#define SCL_PIN     22

// ─── Sensor Objects ──────────────────────────────────────────────────────────
MAX30105 particleSensor;
OneWire oneWire(DS18B20_PIN);
DallasTemperature tempSensor(&oneWire);

// ─── SpO2 / HR buffers ───────────────────────────────────────────────────────
uint32_t irBuffer[100];
uint32_t redBuffer[100];
int32_t  spo2;
int8_t   validSPO2;
int32_t  heartRate;
int8_t   validHeartRate;

// ─── WiFi ────────────────────────────────────────────────────────────────────
bool connectWiFi() {
    Serial.print("Connecting to WiFi");
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    unsigned long startedAt = millis();
    const unsigned long timeoutMs = 20000;
    while (WiFi.status() != WL_CONNECTED && millis() - startedAt < timeoutMs) {
        delay(500);
        Serial.print(".");
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
        return true;
    }
    Serial.println("\nWiFi connection failed. Check WIFI_SSID, WIFI_PASS, and use a 2.4 GHz network.");
    WiFi.disconnect();
    return false;
}

// ─── Validation ──────────────────────────────────────────────────────────────
bool isValidReading(float temp, int hr, int spo2Val) {
    if (hr < 40 || hr > 200)           return false;
    if (spo2Val < 80 || spo2Val > 100) return false;
    if (temp < 25.0 || temp > 42.0)    return false;  // ← FIXED threshold
    return true;
}

// ─── Alert Level ─────────────────────────────────────────────────────────────
String getAlertLevel(float temp, int hr, int spo2Val) {
    if (hr < 40 || hr > 150 ||
        spo2Val < 90 ||
        temp < 25.0 || temp >= 39.0) {  // ← FIXED threshold
        return "critical";
    }
    if ((hr >= 40 && hr < 60) || (hr > 100 && hr <= 150) ||
        (spo2Val >= 90 && spo2Val < 95) ||
        (temp >= 37.3 && temp < 39.0)) {
        return "warning";
    }
    return "normal";
}

// ─── HTTP POST ───────────────────────────────────────────────────────────────
void sendData(float temp, int hr, int spo2Val, String alert) {
    if (WiFi.status() != WL_CONNECTED) {
        connectWiFi();
        return;
    }

    HTTPClient http;
    http.begin(API_ENDPOINT);
    http.addHeader("Content-Type", "application/json");

    JsonDocument doc;
    doc["patient_id"]  = PATIENT_ID;
    doc["heart_rate"]  = hr;
    doc["spo2"]        = spo2Val;
    doc["temperature"] = temp;
    doc["alert"]       = alert;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    Serial.printf("POST %s -> HTTP %d\n", API_ENDPOINT, code);
    http.end();
}

// ─── Setup ───────────────────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);

    Wire.begin(SDA_PIN, SCL_PIN);
    Wire.setTimeout(3000);

    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Serial.println("MAX30102 not found! Check wiring.");
        while (1);
    }
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x1F);
    particleSensor.setPulseAmplitudeIR(0x1F);
    particleSensor.setPulseAmplitudeGreen(0);

    tempSensor.begin();
    tempSensor.setWaitForConversion(false);

    if (!connectWiFi()) {
        Serial.println("WiFi will be retried when the next reading is ready.");
    }
    Serial.println("Setup complete. Place finger FLAT on sensor.");
}

// ─── Main Loop ───────────────────────────────────────────────────────────────
void loop() {

    long irCheck = particleSensor.getIR();
    if (irCheck < IR_FINGER_THRESHOLD) {
        Serial.printf("No finger detected (IR=%ld). Place finger on sensor...\n", irCheck);
        delay(2000);
        return;
    }

    tempSensor.requestTemperatures();

    for (byte i = 0; i < 100; i++) {
        while (!particleSensor.available())
            particleSensor.check();
        redBuffer[i] = particleSensor.getRed();
        irBuffer[i]  = particleSensor.getIR();
        particleSensor.nextSample();
    }

    long irFinal = particleSensor.getIR();
    if (irFinal < IR_FINGER_THRESHOLD) {
        Serial.printf("Finger removed during sampling (IR=%ld) — discarding\n", irFinal);
        delay(2000);
        return;
    }

    float tempC = tempSensor.getTempCByIndex(0);

    if (tempC < -50.0) {
        Serial.println("DS18B20 error (-127). Check wiring and 4.7k pull-up resistor.");
        delay(5000);
        return;
    }

    maxim_heart_rate_and_oxygen_saturation(
        irBuffer, 100, redBuffer,
        &spo2, &validSPO2, &heartRate, &validHeartRate
    );

    int hrVal   = validHeartRate ? (int)heartRate : 0;
    int spo2Val = validSPO2      ? (int)spo2      : 0;

    String alertLevel = getAlertLevel(tempC, hrVal, spo2Val);

    Serial.printf("HR: %d bpm | SpO2: %d%% | Temp: %.2f C | Alert: %s\n",
                  hrVal, spo2Val, tempC, alertLevel.c_str());

    if (!isValidReading(tempC, hrVal, spo2Val)) {
        Serial.printf(
            "Out-of-range values (HR=%d bpm, SpO2=%d%%, Temp=%.2f C) — skipping POST\n",
            hrVal, spo2Val, tempC
        );
        delay(5000);
        return;
    }

    sendData(tempC, hrVal, spo2Val, alertLevel);

    delay(5000);
}
