const MODULE_ID = "eventide-speech-mannerisms";

/**
 * A static class to manage all functionality for the Eventide Speech Mannerisms module.
 */
class EventideSpeechMannerisms {
  /**
   * Initializes the module, setting up the API and registering hooks.
   * This method is called once on the 'init' hook.
   */
  static init() {
    // Expose the API to the game object.
    game.eventide = game.eventide || {};
    game.eventide.speechMannerisms = this;

    // Register hooks.
    Hooks.on("preCreateChatMessage", this.onPreCreateChatMessage.bind(this));
  }

  /**
   * Completes the module setup.
   * This method is called once on the 'setup' hook to ensure localization is ready.
   */
  static setup() {
    // This hook runs once the localization system is ready.
    console.log(game.i18n.localize("esm.init"));
  }

  /**
   * Opens the dialog to configure a speech mannerism for the selected actor.
   */
  static openDialog() {
    const tokens = canvas.tokens.controlled;
    if (tokens.length !== 1) {
      ui.notifications.warn(
        game.i18n.localize("esm.notifications.selectOneToken"),
      );
      return;
    }
    const token = tokens[0];
    const actor = token.actor;

    const existingMannerism = actor.getFlag(MODULE_ID, "mannerism") || "";
    const existingPosition = actor.getFlag(MODULE_ID, "position") || "middle";

    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("esm.dialog.title") },
      content: `
        <form>
          <div class="form-group">
            <label>${game.i18n.localize("esm.dialog.mannerismLabel")}</label>
            <input type="text" name="mannerism" value="${existingMannerism}" placeholder="${game.i18n.localize("esm.dialog.mannerismPlaceholder")}">
          </div>
          <div class="form-group">
            <label>${game.i18n.localize("esm.dialog.positionLabel")}</label>
            <select name="position">
              <option value="start" ${existingPosition === "start" ? "selected" : ""}>${game.i18n.localize("esm.dialog.positionStart")}</option>
              <option value="middle" ${existingPosition === "middle" ? "selected" : ""}>${game.i18n.localize("esm.dialog.positionMiddle")}</option>
              <option value="end" ${existingPosition === "end" ? "selected" : ""}>${game.i18n.localize("esm.dialog.positionEnd")}</option>
            </select>
          </div>
        </form>
      `,
      buttons: [
        {
          action: "submit",
          label: game.i18n.localize("esm.dialog.saveButton"),
          default: true,
          callback: (event, button, dialog) => {
            const form = button.form;
            return {
              mannerism: form.elements.mannerism.value,
              position: form.elements.position.value,
            };
          },
        },
        {
          action: "clear",
          label: game.i18n.localize("esm.dialog.clearButton"),
        },
      ],
      submit: async (result) => {
        if (result === "clear") {
          await actor.unsetFlag(MODULE_ID, "mannerism");
          await actor.unsetFlag(MODULE_ID, "position");
          ui.notifications.info(
            game.i18n.format("esm.notifications.mannerismCleared", {
              actor: actor.name,
            }),
          );
          return;
        }

        if (typeof result === "object" && result !== null) {
          if (result.mannerism) {
            await actor.setFlag(MODULE_ID, "mannerism", result.mannerism);
            await actor.setFlag(MODULE_ID, "position", result.position);
            ui.notifications.info(
              game.i18n.format("esm.notifications.mannerismSet", {
                actor: actor.name,
                mannerism: result.mannerism,
                position: result.position,
              }),
            );
          } else {
            await actor.unsetFlag(MODULE_ID, "mannerism");
            await actor.unsetFlag(MODULE_ID, "position");
            ui.notifications.info(
              game.i18n.format("esm.notifications.mannerismCleared", {
                actor: actor.name,
              }),
            );
          }
        }
      },
      close: () => {},
    }).render({
      position: {
        width: 500,
        height: "auto",
      },
      force: true,
    });
  }

  /**
   * A hook function that runs before a chat message is created.
   * It checks if the message content adheres to the actor's configured speech mannerism.
   * @param {ChatMessage} message - The ChatMessage document.
   * @param {object} data - The data for the message.
   * @param {object} options - Options for message creation.
   * @param {string} userId - The ID of the user creating the message.
   * @returns {boolean} - Returns false to prevent the message from being created if validation fails.
   */
  static onPreCreateChatMessage(message, data, options, userId) {
    if (userId !== game.user.id) {
      return true;
    }

    // Only apply to standard in-character messages.
    // Ignore OOC, emotes, whispers, and any messages that contain dice rolls.
    if (message.style !== CONST.CHAT_MESSAGE_STYLES.IC || message.isRoll) {
      console.log("Not an IC message");
      console.log(message);
      return true;
    }

    const actor = game.actors.get(message.speaker.actor);
    if (!actor) {
      return true;
    }

    const mannerism = actor.getFlag(MODULE_ID, "mannerism");
    const position = actor.getFlag(MODULE_ID, "position");

    if (!mannerism) {
      return true;
    }

    // For each character in the mannerism, allow it to be repeated one or more times.
    // Then, join these characters with the separator pattern.
    const regexString = mannerism
      .split("")
      .map((char) => {
        const escapedChar = char.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        return escapedChar + "+";
      })
      .join("[-.,\\s]*");

    let finalRegex;

    switch (position) {
      case "start":
        finalRegex = new RegExp(`^\\s*${regexString}`, "i");
        break;
      case "end":
        finalRegex = new RegExp(`${regexString}\\s*$`, "i");
        break;
      case "middle":
      default:
        finalRegex = new RegExp(regexString, "i");
        break;
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = message.content;
    const strippedContent = tempDiv.textContent || tempDiv.innerText || "";

    if (!finalRegex.test(strippedContent)) {
      ui.notifications.error(
        game.i18n.format("esm.notifications.validationError", {
          actor: actor.name,
          mannerism: mannerism,
          position: position,
        }),
      );

      // To prevent the chat box from clearing, we restore the content
      // after a short delay, allowing the core logic to clear it first.
      setTimeout(() => {
        const chatInput = document.getElementById("chat-message");
        if (chatInput) {
          chatInput.value = message.content;
        }
      }, 0);

      return false;
    }

    return true;
  }
}

Hooks.once(
  "init",
  EventideSpeechMannerisms.init.bind(EventideSpeechMannerisms),
);
Hooks.once(
  "setup",
  EventideSpeechMannerisms.setup.bind(EventideSpeechMannerisms),
);
