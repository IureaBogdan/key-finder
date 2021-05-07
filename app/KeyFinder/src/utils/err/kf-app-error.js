class KfAppError extends Error {
  constructor(message) {
    super(message);
    this.name = "KfAppError";
  }
}
class BluetoothError extends KfAppError {
  constructor(message) {
    super(message);
    this.name = "BluetoothError";
  }
}
class LocationError extends KfAppError {
  constructor(message) {
    super(message);
    this.name = "LocationError";
  }
}
class LocationServicesError extends KfAppError {
  constructor(message) {
    super(message);
    this.name = "LocationServicesError";
  }
}
class DeviceNotInRangeError extends KfAppError {
  constructor(message) {
    super(message);
    this.name = "DeviceNotInRangeError";
  }
}
export {
  KfAppError,
  BluetoothError,
  LocationError,
  LocationServicesError,
  DeviceNotInRangeError,
}