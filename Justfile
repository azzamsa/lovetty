#!/usr/bin/env -S just --justfile

alias f := fmt
alias l := lint
alias t := test
alias c := comply
alias k := check

[doc('List available commands')]
_default:
    just --list --unsorted

[doc('Set up the repository')]
setup:
    pnpm install

[doc('Make the codebase comply with formatting and linting rules (used in git hooks)')]
comply: fmt lint

[doc('Check if the repository complies with rules and is ready to push')]
check: fmt-check lint

[doc('Format the codebase')]
fmt:
    pnpm run lint --fix
    

[doc('Check if the codebase is properly formatted')]
fmt-check:
    

[doc('Lint the codebase')]
lint:
    pnpm run lint

[doc('Test the codebase')]
test:
    dbus-run-session -- gnome-shell --nested --wayland 

[doc('Create a new release. Example: just release v2.2.0')]
release:
    gnome-extensions pack
