# Guide

Useful commands.

```shell
$ # Create extension interactively
$ gnome-extensions create --interactive

$ # Test the extension (yes, without logging out!)
$ dbus-run-session -- gnome-shell --nested --wayland 

$ # Lint the code
$ pnpm install && pnpm run lint

$ # Publish the code
$ gnome-extensions pack
```
