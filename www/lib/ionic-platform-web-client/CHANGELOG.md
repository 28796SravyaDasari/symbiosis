## 0.5.0

* (user) Added `resetPassword()` method to users
* (user) (fix) Update user details with custom data during `save()`

## 0.4.0

* (auth) Added ability to send data in custom authentication request

## 0.3.0

* (auth) Introduced Authentication component
* **(breaking)** both Ionic.User and Ionic.Push utilize new beta API
  access and have modified/added/removed some of the current methods
* (push) Added public method to get push pluginI
* (user) Added migrate method for alpha users
* (user) (fix) Falsy values are allowed in `get(key, defaultValue)`
* (analytics) (fix) events are no longer mutated


## 0.2.1

* (push) (fix) prevent dev-mode from registering multiple callbacks
* (user) (fix) prevent dev tokens from saving to a user


## 0.2.0

* (core) removing need to call `Ionic.io();` manually
* (deploy) update() can now defer reloading the app
* (deploy) adding `getVersions` and `deleteVersion` methods to manage deploy versions.
* (deploy) adding `getMetadata` method to fetch deploy metadata
* (deploy) (fix) deploy methods now wait for the onReady event


## 0.1.1

* (push) fixed notification handling for dev_push when using angular integrations
* (push) getPayload() now returns the correct payload
* (analytics) fixed incorrect log method references


## 0.1.0

* web client introduction

