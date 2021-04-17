#include "configs/gpio/kf_gpio_task_config.h"
#include "configs/ble/kf_ble_server.h"

void app_main(void)
{
    kf_load_gpio_configurations();
    kf_config_bt();
}