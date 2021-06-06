#ifndef _KF_GPIO_TASK_CONFIG_H_
#define _KF_GPIO_TASK_CONFIG_H_

/**
 * @brief Loads the gpio configurations.
 * @return void
 */
void kf_config_gpio();

/**
 * @brief Turns on the buzzer and the leds for timeInMillis milliseconds
 *  - blocks the execution thread during this time.
 * Needs to be called in a Task.
 * @return void
 */
void kf_find(int timeInMillis);

/**
 * @brief Function that sets a GPIO pin on HIGH(1) for timeInMillis milliseconds
 *  - blocks the execution thread during this time.
 * Needs to be called in a Task.
 * @return void
 */
void kf_set_pin_on_high(int pin, int timeInMillis);
#endif