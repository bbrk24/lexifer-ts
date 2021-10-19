# Changelog

All notable changes to this project will be documented in this file.

## v1.1.2

This version contains very little in the way of functional changes, but
clarifies licensing and extends the `package.json` so as to be ready for
release on npm.

## v1.1.1

### Added

If a rule consists of only `!` or `?` (or some combination thereof) with no
letters, the program will display an error message. Similarly, the program
informs the user if `!!` or `??` appears, or if a rule starts with `?`.

The program now validates that random-rate is a number between 0 and 100
(inclusive).

### Changed

A negative number of words is now rejected.

"Unknown" letters are now recognized better when they are weighted.

The conditions under which misplaced `!` is detected are improved.

Eliminated an obscure issue that made `words: _weight` and similar definitions
invalid.

Even more of the build process is automated, and the dependency versions were
corrected.

## v1.1.0

### Added

Word categories -- words can now be separated into categories that will be
displayed separately in wordgen mode, and categories can have relative
frequencies for paragraph mode.

Verbose mode -- in wordgen mode, the user can request to see each step of the
word generation process individually, which is useful for debugging.

The `words:` directive now allows words to have relative frequencies specified.

### Changed

Custom error messages are now more descriptive, such as `parsing error at 'a'`
rather than just `a`.

If a filter doesn't contain `>`, the program will now alert the user rather
than throwing a TypeError.

If a phoneme has a weight that is a valid but nonsensical number (like `-1`
or `Infinity`), the program will display an error message rather than just
returning 'woo!'.

The project is now built with a shell script rather than raw `tsc`, which
removes the need for me to combine them by hand, substantially reducing
deployment time and streamlining testing.

The compilation target is now ES6 rather than ES5.

## v1.0.4

### Changed

Due to poor browser support, all references to the ES2021 string method
`replaceAll()` were removed in favor of `replace()`.

## v1.0.3

### Changed

The way cluster fields are parsed was changed, allowing the file to end with
a cluster field without throwing a TypeError.

## v1.0.2

### Added

An error message was added, telling the user not to leave their `.def` file
empty.

## v1.0.1

### Changed

The initialization of `pd` was moved to inside a try-catch block, preventing
uncaught errors during initialization that were never revealed to the user.

## v1.0.0

First release!

At this time, the project was closely based on the contemporary python project.
