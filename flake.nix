{
  description = "Big3 Timer - Nix flake for development and NixOS deployment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
  };

  outputs = { self, nixpkgs, ... }:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in {
      packages = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
          big3-timer-frontend = pkgs.buildNpmPackage {
            pname = "big3-timer-frontend";
            version = "0.1.0";
            src = ./frontend;
            npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
            buildPhase = "npm run build";
            installPhase = "cp -r dist $out";
          };
        in {
            big3-timer = pkgs.buildNpmPackage rec {
                pname = "big3-timer-backend";
                version = "0.1.0";
                src = ./backend;
                npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

                dontNpmBuild = true;

                installPhase = ''
                mkdir -p $out/backend
                cp -r ./* $out/backend/

                # Copy frontend build
                mkdir -p $out/frontend
                cp -r ${big3-timer-frontend}/* $out/frontend/

                mkdir -p $out/bin
                cat > $out/bin/big3-timer <<EOF
            #!/bin/sh
            exec ${pkgs.nodejs}/bin/node "$out/backend/server.js" "\$@"
            EOF
                chmod +x $out/bin/big3-timer
                '';

                meta = with pkgs.lib; {
                description = "Big3 Timer backend and frontend bundle";
                license = licenses.mit;
                platforms = platforms.unix;
                };
            };
        });

      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in {
          default = pkgs.mkShell {
          buildInputs = with pkgs; [ nodejs yarn git pkgs.just ];
        shellHook = ''
          echo "Big3 Timer dev shell"
          echo "Available commands:"
          echo "  just dev      - Start both frontend and backend"
          echo "  just frontend - Start frontend only"
          echo "  just backend  - Start backend only"
          echo "  just build    - Build frontend"
          echo "  just serve    - Build and serve via backend"
        '';
          };
        });

      # A simple NixOS module skeleton that runs the backend from /opt/big3-timer/backend
      nixosModules.big3-timer = { config, pkgs, lib, ... }: {
        options = {
          services.big3-timer = lib.mkOption {
            type = lib.types.submodule;
            default = {
              enable = false;
              backendPath = "/opt/big3-timer/backend";
              user = "big3timer";
              port = 3000;
            };
            description = "Options for the big3-timer service";
          };
        };

        config = lib.mkIf config.services.big3-timer.enable {
          users.users."${config.services.big3-timer.user}" = {
            isSystemUser = true;
            createHome = false;
            description = "big3-timer service user";
          };

          systemd.services.big3-timer = {
            description = "Big3 Timer Backend";
            after = [ "network.target" ];
            wantedBy = [ "multi-user.target" ];
            serviceConfig = {
              Type = "simple";
            };
            script = ''
              exec ${pkgs.nodejs}/bin/node ${config.services.big3-timer.backendPath}/server.js
            '';
          };
        };
      };
    };
}
