{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [ pkgs.nodejs_20 ];
  idx = {
    extensions = [];
    workspace = {
      onCreate = {
        install-deps = "npm install --prefix backend && npm install --prefix frontend";
      };
      onStart = {
        backend = {
          command = "npm start --prefix backend";
          onExit = "restart";
        };
      };
    };
    previews = {
      enable = true;
      previews = [
        {
          id = "web";
          command = ["npm" "start" "--prefix" "frontend"];
          port = 3000;
          onOpen = "open";
        }
      ];
    };
  };
}
