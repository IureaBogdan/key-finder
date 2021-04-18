#ifndef _KF_DEFS_H_
#define _KF_DEFS_H_

// LEDC
#define LEDC_HS_TIMER LEDC_TIMER_0
#define LEDC_HS_MODE LEDC_HIGH_SPEED_MODE
#define BUZZER_PIN 15
#define FREQUECY 5000
// GPIO
#define LRED_PIN 5
#define LGREEN_PIN 18
#define LBLUE_PIN 19
#define BUTTON_PIN 23

#define LOW 0
#define HIGH 1

#define OUTPUT_MASK ((1ULL << LRED_PIN) | (1ULL << LGREEN_PIN) | (1ULL << LBLUE_PIN) | (1ULL << BUZZER_PIN))
#define INPUT_MASK ((1ULL << BUTTON_PIN))

#endif