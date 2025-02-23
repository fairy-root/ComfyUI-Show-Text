class ShowTextNode:
    @classmethod
    def INPUT_TYPES(cls):
        """Define the input types and parameters for the node"""
        return {
            "required": {
                "input_text": ("STRING", {"forceInput": True}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    # Support list inputs for batch processing
    INPUT_IS_LIST = True
    RETURN_TYPES = ("STRING",)
    FUNCTION = "display_text"
    OUTPUT_NODE = True
    OUTPUT_IS_LIST = (True,)
    CATEGORY = "utils"

    def display_text(self, input_text, unique_id=None, extra_pnginfo=None):
        """
        Display the input text and handle workflow state updates
        
        Parameters:
            input_text: The text to display
            unique_id: Node identifier for workflow updates
            extra_pnginfo: Additional workflow information
        """
        # Update workflow state if IDs are provided
        if unique_id is not None and extra_pnginfo is not None:
            self._update_workflow_state(unique_id, extra_pnginfo, input_text)

        # Return both UI update and result
        return {
            "ui": {"text": input_text},
            "result": (input_text,)
        }

    def _update_workflow_state(self, unique_id, extra_pnginfo, text_value):
        """Update the workflow state with the new text value"""
        if not isinstance(extra_pnginfo, list):
            print("Error: Workflow info must be a list")
            return
            
        if not isinstance(extra_pnginfo[0], dict) or "workflow" not in extra_pnginfo[0]:
            print("Error: Invalid workflow information format")
            return

        # Find and update the node in the workflow
        workflow = extra_pnginfo[0]["workflow"]
        target_node = next(
            (node for node in workflow["nodes"] if str(node["id"]) == str(unique_id[0])),
            None
        )
        
        if target_node:
            target_node["widgets_values"] = [text_value]


# Register the node
NODE_CLASS_MAPPINGS = {
    "ShowText": ShowTextNode,
}

# Define display name
NODE_DISPLAY_NAME_MAPPINGS = {
    "ShowText": "Show Text",
}
