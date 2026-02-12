package avl;

/**
 * AVL tree: self-balancing BST. Insert, delete, contains; rebalance via rotations.
 */
public class AVLTree {
    private AVLNode root;
    private int size;

    public AVLTree() {
        this.root = null;
        this.size = 0;
    }

    public AVLNode getRoot() {
        return root;
    }

    public int getSize() {
        return size;
    }

    private int height(AVLNode n) {
        return n == null ? 0 : n.height;
    }

    private int balanceFactor(AVLNode n) {
        return n == null ? 0 : height(n.left) - height(n.right);
    }

    private void updateHeight(AVLNode n) {
        if (n != null) {
            n.height = 1 + Math.max(height(n.left), height(n.right));
        }
    }

    private AVLNode rotateRight(AVLNode z) {
        AVLNode y = z.left;
        AVLNode T3 = y.right;
        y.right = z;
        z.left = T3;
        updateHeight(z);
        updateHeight(y);
        return y;
    }

    private AVLNode rotateLeft(AVLNode z) {
        AVLNode y = z.right;
        AVLNode T2 = y.left;
        y.left = z;
        z.right = T2;
        updateHeight(z);
        updateHeight(y);
        return y;
    }

    private AVLNode rebalance(AVLNode n) {
        if (n == null) return null;
        updateHeight(n);
        int bf = balanceFactor(n);
        if (bf > 1) {
            if (balanceFactor(n.left) < 0) {
                n.left = rotateLeft(n.left);
            }
            return rotateRight(n);
        }
        if (bf < -1) {
            if (balanceFactor(n.right) > 0) {
                n.right = rotateRight(n.right);
            }
            return rotateLeft(n);
        }
        return n;
    }

    public boolean contains(int key) {
        AVLNode cur = root;
        while (cur != null) {
            if (key == cur.value) return true;
            cur = key < cur.value ? cur.left : cur.right;
        }
        return false;
    }

    public void insert(int key) {
        root = insert(root, key);
        size++;
    }

    private AVLNode insert(AVLNode n, int key) {
        if (n == null) return new AVLNode(key);
        if (key < n.value) {
            n.left = insert(n.left, key);
        } else if (key > n.value) {
            n.right = insert(n.right, key);
        } else {
            size--;
            return n;
        }
        return rebalance(n);
    }

    public boolean delete(int key) {
        int prev = size;
        root = delete(root, key);
        return size != prev;
    }

    private AVLNode delete(AVLNode n, int key) {
        if (n == null) return null;
        if (key < n.value) {
            n.left = delete(n.left, key);
        } else if (key > n.value) {
            n.right = delete(n.right, key);
        } else {
            size--;
            if (n.left == null) return n.right;
            if (n.right == null) return n.left;
            AVLNode min = minNode(n.right);
            n.value = min.value;
            n.right = delete(n.right, min.value);
        }
        return rebalance(n);
    }

    private AVLNode minNode(AVLNode n) {
        while (n.left != null) n = n.left;
        return n;
    }

    public void clear() {
        root = null;
        size = 0;
    }
}
