package avl;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Entry point: start HTTP server, serve static files and API.
 */
public class Main {

    public static void main(String[] args) throws IOException {

        // Use Render's dynamic PORT (fallback to 8080 for local testing)
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));

        // Serve files from root directory
        Path staticRoot = Paths.get(".").toAbsolutePath();


        AVLTree tree = new AVLTree();
        TreeController controller = new TreeController(tree, staticRoot);

        // Bind to 0.0.0.0 for cloud deployment
        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);

        server.createContext("/", controller);
        server.setExecutor(null);
        server.start();

        System.out.println("AVL Tree server running on port " + port);
    }
}
