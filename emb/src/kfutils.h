#ifndef _KFUTILS_H_
#define _KFUTILS_H_

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "driver/gpio.h"

#define LRED_PIN     17
#define LGREEN_PIN   18
#define LBLUE_PIN    19
#define BUZZER_PIN   21
#define BUTTON_PIN   23

#define LOW 0
#define HIGH 1

#define OUTPUT_MASK  ((1ULL<<LRED_PIN) | (1ULL<<LGREEN_PIN) | (1ULL<<LBLUE_PIN) | (1ULL << BUZZER_PIN))
#define INPUT_MASK ((1ULL << BUTTON_PIN))

/**
 * @brief Alternates the colors of the RGB LED for timeInMillis milliseconds
 * 
 * @param timeInMillis Time in milliseconds
 *
 * @return void
*/
void alternate_fast_blink(int timeInMillis);

/**
 * @brief Turns on the buzzer for timeInMillis milliseconds
 * 
 * @param timeInMillis Time in milliseconds
 *
 * @return void
*/
void buzz(int timeInMillis);

/**
 * @brief Sets the specified pin on HIGH for timeInMillis milliseconds  
 * 
 * @param timeInMillis Time in milliseconds
 * 
 * @param pin Specify the pin
 * 
 * @return void
 */
void set_pin_on_high(unsigned int pin, unsigned int timeInMillis);

#endif