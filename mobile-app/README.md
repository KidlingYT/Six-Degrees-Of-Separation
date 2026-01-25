# This is a project for creating and expanding a professional network. 

> It contains two apps 

1. A React Native boilerplate app that lets you export your contacts as json from your iPhone.
2. A React Web app that lets you import these contacts and manage your network.

## Usage

## 1. Extract your contacts from your iPhone using the React Native App.

### 1.1 
```sh
cd mobile-app
npm install
# Only use --tunnel if you are on a public network.
npx expo start --tunnel
```

### 1.2

Download Expo GO: https://expo.dev/go

### 1.3 

Scan the QR code from the dev server and open the mobile app on your phone.

### 1.4 

Hit the "export contacts" text. This should give you a json file on your phone.

### 1.5

Send this file to yourself via email - it will be used in the web app.

## 2. Running the web app.