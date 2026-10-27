{
  description = "Grove development flake";
  inputs.nixpkgs.url = "https://channels.nixos.org/nixos-unstable/nixexprs.tar.xz";
  outputs = inputs: {
    devShells = inputs.nixpkgs.lib.genAttrs ["x86_64-linux" "aarch64-linux" "aarch64-darwin"] (system:
    let
      pkgs = import inputs.nixpkgs { inherit system; };
      # scripts/generate-schema.sh relies on https://github.com/jsontypedef/json-typedef-codegen
      jtd-codegen = pkgs.rustPlatform.buildRustPackage rec {
        pname = "jtd-codegen";
        version = "0.4.1";
        src = pkgs.fetchFromGitHub {
          owner = "jsontypedef";
          repo = "json-typedef-codegen";
          rev = "v${version}";
          hash = "sha256-RUGMZxEWDoIIa8KPCcCevx9hUv4XBZxNZSvz2I6ZQqQ=";
        };
        cargoLock.lockFile = "${src}/Cargo.lock";
        buildAndTestSubdir = "crates/cli";
        doCheck = false; # skip running `cargo test`
      };
    in {
      default = pkgs.mkShell {
        packages = [
          jtd-codegen
          pkgs.nodejs_22
          pkgs.elan # reuses existing ~/.elan toolchains
          pkgs.git
        ];
      };
    });
  };
}