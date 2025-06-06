# Eventide Speech Mannerisms

This module is designed to enforce speech mannerisms for characters in Foundry Virtual Tabletop. Do you have a character who always starts or ends a message in a certain way? How about one that always uses a certain word somewhere within their message? With this module, you can ensure that you (and your players) include these mannerisms before sending a message as a character.

## Features

-   **Set Per-Actor Mannerisms:** Define a unique speech mannerism and its required position for any actor.
-   **Flexible Positioning:**
    -   **Start:** The mannerism must appear at the beginning of the message.
    -   **Middle:** The mannerism must appear somewhere in the message.
    -   **End:** The mannerism must appear at the end of the message.
-   **Flexible Formatting:** The module's validation allows for common separators (like spaces, commas, periods, and hyphens) between the letters of the mannerism. For example, if the mannerism is "hmmm", the message could contain "h-m-m-m" or "h.m.m.m." and still be valid.
-   **Easy Configuration:** A simple dialog allows you to set, change, or clear an actor's mannerism.
-   **Simple Macro API:** A global API is provided to easily open the configuration dialog.

## Installation

1.  Go to the "Add-on Modules" tab in the "Configuration and Setup" screen.
2.  Click "Install Module".
3.  Search for "Eventide Speech Mannerisms" and click "Install".
4.  Activate the module in your game world's "Manage Modules" settings.

## Usage

To configure a speech mannerism for an actor, you first need to create a macro.

### Creating the Macro

1.  Navigate to the "Macros" tab in the sidebar.
2.  Click "Create Macro".
3.  Set the name to something memorable, like "Set Speech Mannerism".
4.  Change the "Type" to "Script".
5.  In the "Script" field, enter the following command:
    ```javascript
    game.eventide.speechMannerisms.openDialog();
    ```
6.  Save the macro. You can now drag it to your hotbar for easy access.

### Setting a Mannerism

1.  Click on a token in the scene to select it.
2.  Click your "Set Speech Mannerism" macro.
3.  A dialog will appear, allowing you to enter the mannerism (e.g., "you see") and select its position (Start, Middle, or End).
4.  Click "Save".

Now, whenever anyone speaks as that character, the module will check if their message follows the configured rule. If it doesn't, the message will be blocked, and an error notification will appear.

# License
This project is licensed under LGPL 2.1+. See the LICENSE.md file for more details.