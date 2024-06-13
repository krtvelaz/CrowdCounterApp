# Crowding of people Capture Project with Ionic 7

This project is a mobile application developed with Ionic 7 that uses the device's camera to capture images at regular (configurable) intervals and send them to a server. The server processes these images to count the number of people in a specific location.

## Features

- Capture images using the device's camera.
- Configurable time intervals for image capture.
- Send images to a server for processing.
- Calculate the number of people in a location from the sent images.

## Requirements

- Node.js (v14 or later)
- Ionic CLI (v7)
- A server account with an endpoint to receive and process images.

## Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/your-username/repository-name.git
    cd repository-name
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Configure the server endpoint and capture interval in the configuration file:
    ```typescript
    // src/environments/environment.ts
    export const environment = {
      production: false,
      serverUrl: 'https://your-server.com/endpoint',
      captureInterval: 60000 // Interval in milliseconds (e.g., 60000 ms = 60 seconds)
    };
    ```

4. Run the application in development mode:
    ```bash
    ionic serve
    ```

## Usage

1. Launch the application on your device or emulator.
2. Configure the capture interval from the user interface if available.
3. The application will start capturing images at the specified intervals and automatically send them to the configured server.

## Project Structure

- `src/`: Contains the application source code.
  - `app/`: Main modules and components of the application.
  - `environments/`: Environment configurations for different modes (development, production).
  - `services/`: Services for image capture and server communication.

## Technologies Used

- [Ionic 7](https://ionicframework.com/docs) - Framework for developing hybrid mobile applications.
- [Angular](https://angular.io/) - Web framework used by Ionic.
- [Capacitor](https://capacitor.ionicframework.com/) - To access the device's camera, microphone, and storage.

## Permissions

When compiling the application, ensure to grant the necessary permissions for accessing the camera, microphone, and storage. This can be done by configuring the `capacitor.config.ts` file and adjusting the platform-specific settings (e.g., AndroidManifest.xml for Android and Info.plist for iOS).

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  plugins: {
    Camera: {
      permissions: {
        camera: true,
        microphone: true,
        storage: true
      }
    }
  }
};
export default config;
```

## Contribution

1. Fork the project.
2. Create a new branch (`git checkout -b feature/new-feature`).
3. Make the necessary changes and commit them (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

If you have any questions or suggestions, feel free to contact us at [Contact](mailto:carlos.martinez.dation@gmail.com).
