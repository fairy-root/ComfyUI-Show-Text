import { app } from "../../../scripts/app.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";

// Displays input text on a node
app.registerExtension({
  name: "ShowText",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name === "ShowText") {
      function populate(text) {
        if (this.widgets) {
          for (let i = 0; i < this.widgets.length; i++) {
            this.widgets[i]?.onRemove?.();
          }
          this.widgets.length = 0;
        }

        const v = [...text];
        if (!v[0]) {
          v.shift();
        }
        for (const list of v) {
          const w = ComfyWidgets["STRING"](
            this,
            "text2",
            ["STRING", { multiline: true }],
            app
          ).widget;
          const el = w.inputEl || w.element;
          if (el) {
            el.readOnly = true;
            el.style.opacity = 0.6;
          }
          w.value = list;
        }

        requestAnimationFrame(() => {
          const sz = this.computeSize();
          if (sz[0] < this.size[0]) {
            sz[0] = this.size[0];
          }
          if (sz[1] < this.size[1]) {
            sz[1] = this.size[1];
          }
          this.onResize?.(sz);
          app.graph.setDirtyCanvas(true, false);
        });
      }

      // When the node is executed we will be sent the input text, display this in the widget
      const onExecuted = nodeType.prototype.onExecuted;
      nodeType.prototype.onExecuted = function (message) {
        onExecuted?.apply(this, arguments);
        populate.call(this, message.text);
      };

      const onConfigure = nodeType.prototype.onConfigure;
      nodeType.prototype.onConfigure = function () {
        onConfigure?.apply(this, arguments);
        if (this.widgets_values?.length) {
          populate.call(
            this,
            this.widgets_values.slice(+this.widgets_values.length > 1)
          );
        }
      };
    }
  },
});
