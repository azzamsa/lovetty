/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib'

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// Configurable variables
const CONFETTI_COUNT = 280;
const GRAVITY = 0.25;
const INITIAL_SPEED_Y = 15;
const SPEED_X_RANGE = 4;
const FRAME_INTERVAL = 12;

// Hand picked emojis!
const EMOJIS = [
    // Delicious Food
    '🍕',
    '🍣',
    '🍔',
    '🍩',
    '🍰',
    '🧁',
    '🍹',
    '🧋',

    // Vacations
    '🏖️',
    '🏕️',
    '🚀',
    '⛲',
    '🎠',
    '🛝',

    // Up up up!
    '💸',
    '💰',
    '👑',
    '🔥',
    '💪🏼',
    '🦾',
    '💡',
    '🧪',
    '❤️',

    // Cuteness overload!
    '🦄',
    '🐇',
    '🐣',
    '🐲',
    '🦀',
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
    const screenHeight = Main.layoutManager.primaryMonitor.height;
    const screenWidth = Main.layoutManager.primaryMonitor.width;

    for (let i = 0; i < CONFETTI_COUNT; i++) {
        const startFromLeft = i % 2 === 0;
        const xPos = startFromLeft ? 0 : screenWidth;
        const yPos = screenHeight - 10;

        const colorOptions = ["#FF1461", "#18FF92", "#5A87FF", "#FBF38C"];
        const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        const size = Math.floor(Math.random() * 8) + 4;

        const confetti = new St.Bin({
            style_class: '',
            reactive: false,
        });
        confetti.set_style(`background-color: ${randomColor}; width: ${size}px; height: ${size}px; border-radius: 50%;`);
        confetti.set_position(xPos, yPos);
        Main.layoutManager.addChrome(confetti);

        const speedX = startFromLeft ? Math.random() * SPEED_X_RANGE + 4 : -(Math.random() * SPEED_X_RANGE + 4);
        const speedY = -(Math.random() * 8 + INITIAL_SPEED_Y);

        confettiElements.push({
            actor: confetti,
            x: xPos,
            y: yPos,
            speedX: speedX,
            speedY: speedY,
            gravity: GRAVITY,
        });
    }
}

function animateConfetti() {
    const screenHeight = Main.layoutManager.primaryMonitor.height;

    confettiElements.forEach(confetti => {
        confetti.x += confetti.speedX;
        confetti.y += confetti.speedY;

        confetti.speedY += confetti.gravity;

        if (confetti.y > screenHeight) {
            confetti.actor.destroy();
        } else {
            confetti.actor.set_position(confetti.x, confetti.y);
        }
    });

    confettiElements = confettiElements.filter(confetti => confetti.y <= screenHeight);

    if (confettiElements.length > 0) {
        return GLib.SOURCE_CONTINUE;
    } else {
        return GLib.SOURCE_REMOVE;
    }
}

function startConfetti() {
    createConfetti();

    animationLoop = GLib.timeout_add(GLib.PRIORITY_DEFAULT, FRAME_INTERVAL, animateConfetti);
}

function clearConfetti() {
    confettiElements.forEach(confetti => confetti.actor.destroy());
    confettiElements = [];
    if (animationLoop) {
        GLib.Source.remove(animationLoop);
        animationLoop = null;
    }
}
