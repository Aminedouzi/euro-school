<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function __construct(
        private readonly array $roles
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! in_array($request->user()->role, $this->roles, true)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        return $next($request);
    }
}
