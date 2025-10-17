<?php
namespace App\Middlewares;

class AuthMiddleware
{
    /**
     * Verifica que el usuario haya iniciado sesión
     * Si no, redirige a /login
     */
    public static function requireAuth(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user'])) {
            header('Location: /login');
            exit();
        }
    }

    /**
     * Verifica que el usuario sea administrador
     * Si no, redirige a /login o /
     */
    public static function requireAdmin(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['admin'])) {
            header('Location: /');
            exit();
        }
    }

    /**
     * Si el usuario ya está autenticado y visita /login, cierra sesión
     */
    public static function clearSessionOnLogin(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (isset($_SESSION['user']) || isset($_SESSION['admin'])) {
            session_unset();
            session_destroy();
        }
    }
}
