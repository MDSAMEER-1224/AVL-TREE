package avl;

/**
 * Node for AVL tree. Stores value, left/right children, and height.
 */
public class AVLNode {
    public int value;
    public AVLNode left;
    public AVLNode right;
    public int height;

    public AVLNode(int value) {
        this.value = value;
        this.height = 1;
    }
}
