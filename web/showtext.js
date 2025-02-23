import { app } from "../../scripts/app.js";
import { ComfyWidgets } from "../../scripts/widgets.js";

/**
 * Extension to show text content in ComfyUI nodes
 */
app.registerExtension({
    name: "ShowText",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ShowText") {
            // Add text display functionality to the node
            this.setupShowText(nodeType, app);
        }
    },

    setupShowText(nodeType, app) {
        /**
         * Updates the node's text display widgets
         * @param {string[]} textContent - Array of text content to display
         */
        function updateDisplayWidgets(textContent) {
            // Remove existing display widgets
            if (this.widgets) {
                for (let i = 1; i < this.widgets.length; i++) {
                    this.widgets[i].onRemove?.();
                }
                this.widgets.length = 1;
            }

            // Create widgets for each text item
            const textItems = [...textContent];
            if (!textItems[0]) {
                textItems.shift();
            }

            // Add a display widget for each text item
            for (const text of textItems) {
                const displayWidget = this.createDisplayWidget(text, app);
                this.configureDisplayWidget(displayWidget);
            }

            // Update node size to fit content
            this.updateNodeSize();
        }

        /**
         * Creates a new text display widget
         * @param {string} text - Text content to display
         * @param {object} app - ComfyUI app instance
         * @returns {object} The created widget
         */
        function createDisplayWidget(text, app) {
            const widget = ComfyWidgets["STRING"](
                this,
                "display_text",
                ["STRING", { multiline: true }],
                app
            ).widget;

            widget.inputEl.readOnly = true;
            widget.inputEl.style.opacity = 0.6;
            widget.value = text;

            return widget;
        }

        /**
         * Updates the node size to fit content
         */
        function updateNodeSize() {
            requestAnimationFrame(() => {
                const newSize = this.computeSize();
                newSize[0] = Math.max(newSize[0], this.size[0]);
                newSize[1] = Math.max(newSize[1], this.size[1]);
                
                this.onResize?.(newSize);
                app.graph.setDirtyCanvas(true, false);
            });
        }

        // Attach methods to node prototype
        nodeType.prototype.updateDisplayWidgets = updateDisplayWidgets;
        nodeType.prototype.createDisplayWidget = createDisplayWidget;
        nodeType.prototype.updateNodeSize = updateNodeSize;

        // Handle node execution
        const onExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = function(message) {
            onExecuted?.apply(this, arguments);
            this.updateDisplayWidgets.call(this, message.text);
        };

        // Handle node configuration
        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function() {
            onConfigure?.apply(this, arguments);
            if (this.widgets_values?.length) {
                const values = this.widgets_values.slice(+this.widgets_values.length > 1);
                this.updateDisplayWidgets.call(this, values);
            }
        };
    }
}); 