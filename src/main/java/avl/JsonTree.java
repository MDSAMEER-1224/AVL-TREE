package avl;

/**
 * DTO for serializing AVL tree to JSON. Recursive: left/right are JsonTree or null.
 */
public class JsonTree {
    public final int value;
    public final JsonTree left;
    public final JsonTree right;
    public final int height;

    public JsonTree(int value, JsonTree left, JsonTree right, int height) {
        this.value = value;
        this.left = left;
        this.right = right;
        this.height = height;
    }

    public static JsonTree from(AVLNode n) {
        if (n == null) return null;
        return new JsonTree(
            n.value,
            from(n.left),
            from(n.right),
            n.height
        );
    }

    /** Build JSON string without external library. */
    public static String toJson(JsonTree t) {
        if (t == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append("{\"value\":").append(t.value);
        sb.append(",\"left\":").append(toJson(t.left));
        sb.append(",\"right\":").append(toJson(t.right));
        sb.append(",\"height\":").append(t.height).append("}");
        return sb.toString();
    }
}
