
import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib'

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// Configurable variables
const GRAVITY = 0.25;
const INITIAL_SPEED_Y = 15;
const SPEED_X_RANGE = 4;
const FRAME_INTERVAL = 12;
// Hand picked emojis!
const EMOJIS = [
    // Delicious Food
    "🍕",
    "🍣",
    "🍔",
    "🍩",
    "🍰",
    "🧁",
    "🍹",
    "🧋",

    // Vacations
    "🏖️",
    "🏕️",
    "🚀",
    "⛲",
    "🎠",
    "🛝",

    // Up up up!
    "💸",
    "💰",
    "👑",
    "🔥",
    "💪🏼",
    "🦾",
    "💡",
    "🧪",
    "❤️",

    // Cuteness overload!
    "🦄",
    "🐇",
    "🐣",
    "🐲",
    "🦀",
];


let confettiElements = [];
let animationLoop = null;

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('My Shiny Indicator'));

            this.icon = new St.Icon({
                gicon: Gio.FileIcon.new(
                    Gio.File.new_for_path(`${extensionPath}/icons/hicolor/scalable/actions/default-symbolic.svg`)
                ),
                style_class: 'system-status-icon',
            });
            this.add_child(this.icon);


            // Enable click interaction
            this.connect('button-press-event', () => {
                startConfetti()
            });
        }
    },
);

export default class LovettyExtension extends Extension {
    enable() {
        this._indicator = new Indicator(this.path);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function createConfetti() {
    const { height, width } = Main.layoutManager.primaryMonitor;
    const fontMin = 16,
        fontMax = 26;

    for (const emoji of EMOJIS) {
        const fontSize = Math.floor(Math.random() * (fontMax - fontMin)) + fontMin;

        const label = new St.Label({
            text: emoji,
            reactive: false,
            style: `font-size: ${fontSize}px;`,
        });

        const x = Math.random() * width;
        const y = height - 10;
        label.set_position(x, y);
        Main.layoutManager.addChrome(label);

        const speedX = (Math.random() - 0.5) * SPEED_X_RANGE * 2;
        const speedY = -(Math.random() * 8 + INITIAL_SPEED_Y);

        confettiElements.push({
            actor: label,
            x,
            y,
            speedX,
            speedY,
            gravity: GRAVITY,
        });
    }
}

function animateConfetti() {
    const screenHeight = Main.layoutManager.primaryMonitor.height;

    for (const confetti of confettiElements) {
        confetti.x += confetti.speedX;
        confetti.y += confetti.speedY;
        confetti.speedY += confetti.gravity;

        if (confetti.y > screenHeight) {
            confetti.actor.destroy();
        } else {
            confetti.actor.set_position(confetti.x, confetti.y);
        }
    };

    confettiElements = confettiElements.filter(confetti => confetti.y <= screenHeight);

    if (confettiElements.length > 0) {
        return GLib.SOURCE_CONTINUE;
    } else {
        return GLib.SOURCE_REMOVE;
    }

    confettiElements = confettiElements.filter((c) => c.y <= screenHeight);

    if (confettiElements.length === 0) {
        animationLoop = null;  // clear it so next click can re-start cleanly
        return GLib.SOURCE_REMOVE;
    }

    confettiElements = confettiElements.filter(c => c.y <= screenHeight);
    return confettiElements.length > 0 ? GLib.SOURCE_CONTINUE : GLib.SOURCE_REMOVE;
}

function startConfetti() {
    if (animationLoop !== null) {
        GLib.Source.remove(animationLoop); // Cancel previous loop
        animationLoop = null;
    }

    createConfetti();
    animationLoop = GLib.timeout_add(
        GLib.PRIORITY_DEFAULT,
        FRAME_INTERVAL,
        animateConfetti,
    );
}
