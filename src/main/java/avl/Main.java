package avl;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Entry point: start HTTP server on port 8080, serve static files and API.
 */
public class Main {
    private static final int PORT = 8080;

    public static void main(String[] args) throws IOException {
        Path staticRoot = Paths.get("static").toAbsolutePath();
        AVLTree tree = new AVLTree();
        TreeController controller = new TreeController(tree, staticRoot);

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", controller);
        server.setExecutor(null);
        server.start();
        System.out.println("AVL Tree server running at http://localhost:" + PORT);
    }
}
