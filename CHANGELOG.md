# Changelog

All notable changes to this project will be documented in this file.

### v1.0.4

## Changed

Due to poor browser support, all references to the ES2021 string method
`replaceAll()` were removed in favor of `replace()`.

### v1.0.3

## Changed

The way cluster fields are parsed was changed, allowing the file to end with
a cluster field without throwing a TypeError.

### v1.0.2

## Added

An error message was added, telling the user not to leave their `.def` file
empty.

### v1.0.1

## Changed

The initialization of `pd` was moved to inside a try-catch block, preventing
uncaught errors during initialization that were never revealed to the user.

### v1.0.0

First release!

At this time, the project was closely based on the contemporary python project.
