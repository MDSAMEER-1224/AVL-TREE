package avl;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Handles API and static file requests. Single shared AVLTree instance.
 */
public class TreeController implements HttpHandler {
    private final AVLTree tree;
    private final Path staticRoot;

    public TreeController(AVLTree tree, Path staticRoot) {
        this.tree = tree;
        this.staticRoot = staticRoot;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if (path.startsWith("/api/")) {
            handleApi(exchange, path, method);
            return;
        }
        serveStatic(exchange, path);
    }

    private void handleApi(HttpExchange exchange, String path, String method) throws IOException {
        String response;
        int status = 200;
        try {
            if ("/api/tree".equals(path) && "GET".equals(method)) {
                response = apiTree();
            } else if ("/api/insert".equals(path) && "POST".equals(method)) {
                response = apiInsert(readBody(exchange));
            } else if ("/api/delete".equals(path) && "POST".equals(method)) {
                response = apiDelete(readBody(exchange));
            } else if ("/api/clear".equals(path) && "POST".equals(method)) {
                response = apiClear();
            } else {
                status = 404;
                response = jsonMessage("Not found");
            }
        } catch (Exception e) {
            status = 400;
            response = jsonMessage("Error: " + e.getMessage());
        }
        sendJson(exchange, status, response);
    }

    private String apiTree() {
        JsonTree jt = JsonTree.from(tree.getRoot());
        return "{\"tree\":" + JsonTree.toJson(jt) + ",\"size\":" + tree.getSize() + "}";
    }

    private String apiInsert(String body) {
        int value = parseValue(body);
        tree.insert(value);
        JsonTree jt = JsonTree.from(tree.getRoot());
        return "{\"tree\":" + JsonTree.toJson(jt) + ",\"size\":" + tree.getSize() + ",\"message\":\"Inserted " + value + "\"}";
    }

    private String apiDelete(String body) {
        int value = parseValue(body);
        boolean removed = tree.delete(value);
        JsonTree jt = JsonTree.from(tree.getRoot());
        String msg = removed ? "Deleted " + value : "Value " + value + " not found";
        return "{\"tree\":" + JsonTree.toJson(jt) + ",\"size\":" + tree.getSize() + ",\"message\":\"" + escapeJson(msg) + "\"}";
    }

    private String apiClear() {
        tree.clear();
        return "{\"tree\":null,\"size\":0,\"message\":\"Tree cleared\"}";
    }

    private static int parseValue(String body) {
        if (body == null || body.isBlank()) throw new IllegalArgumentException("Missing body");
        String s = body.trim();
        int i = s.indexOf("\"value\"");
        if (i < 0) throw new IllegalArgumentException("Missing value field");
        i = s.indexOf(':', i);
        if (i < 0) throw new IllegalArgumentException("Invalid JSON");
        int start = i + 1;
        while (start < s.length() && (s.charAt(start) == ' ' || s.charAt(start) == '\t')) start++;
        int end = start;
        if (start < s.length() && (s.charAt(start) == '-' || Character.isDigit(s.charAt(start)))) {
            if (s.charAt(start) == '-') end++;
            while (end < s.length() && Character.isDigit(s.charAt(end))) end++;
        }
        return Integer.parseInt(s.substring(start, end).trim());
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String jsonMessage(String msg) {
        return "{\"message\":\"" + escapeJson(msg) + "\"}";
    }

    private String readBody(HttpExchange exchange) throws IOException {
        InputStream in = exchange.getRequestBody();
        byte[] buf = in.readAllBytes();
        return new String(buf, StandardCharsets.UTF_8);
    }

    private void sendJson(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(bytes);
        }
    }

    private void serveStatic(HttpExchange exchange, String path) throws IOException {

    if (path.equals("/") || path.isEmpty()) {
        path = "/index.html";
    }

    Path file = staticRoot.resolve(path.substring(1)).normalize();

    if (!Files.exists(file) || !Files.isRegularFile(file)) {
        sendJson(exchange, 404, jsonMessage("Not found"));
        return;
    }

    byte[] content = Files.readAllBytes(file);

    exchange.getResponseHeaders().set("Content-Type", contentType(path));
    exchange.sendResponseHeaders(200, content.length);

    try (OutputStream out = exchange.getResponseBody()) {
        out.write(content);
    }
}



    private static String contentType(String path) {
        if (path.endsWith(".html")) return "text/html; charset=UTF-8";
        if (path.endsWith(".css")) return "text/css; charset=UTF-8";
        if (path.endsWith(".js")) return "application/javascript; charset=UTF-8";
        return "application/octet-stream";
    }
}
