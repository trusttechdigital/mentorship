{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [ pkgs.nodejs_20 pkgs.postgresql ];

  services.postgres.enable = true;

  idx = {
    workspace = {
      onCreate = {
        install-deps = "npm install --prefix backend && npm install --prefix frontend";
      };
      onStart = {
        backend = "npm start --prefix backend";
        frontend = "npm start --prefix frontend";
      };
    };
    previews = {
      enable = true;
    };
  };
}
