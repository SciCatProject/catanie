/**
 * NOTE: This file contains commands that generate new typescript-angular sdk against the running scicat backend
 * which overwrites the node_modules/@scicatproject/scicat-sdk-ts for development purpose
 * It should NOT be used in production because the real (@scicatproject/scicat-sdk-ts) npm package will be installed and used.
 */

const execSync = require("child_process").execSync;
const os = require("os");

function isWindows() {
  return os.platform() === "win32";
}

function getCurrentDirectory() {
  if (isWindows()) {
    return "%cd%";
  }

  return "$(pwd)";
}

if (isWindows()) {
  // NOTE: First do some cleanup before starting the generation
  console.log("Cleanup old files...");
  execSync(
    "rm -rf node_modules/@scicatproject/scicat-sdk-ts && rm -rf @scicatproject/scicat-sdk-ts",
    { encoding: "utf-8" },
  );

  console.log("Generating the new sdk...");
  /**
   * NOTE: parameter --skip-validate-spec is passed to avoid some errors like not supporting the "content" in the @ApiQuery() parameter that we use in the dataset v4 controller.
   * This should not be a risk as after the generation we can get a feedback immediately if something is broken here when we run and test the frontend.
   */
  const generationOutput = execSync(
    `docker run --rm --add-host host.docker.internal:host-gateway -v "${getCurrentDirectory()}:/local" openapitools/openapi-generator-cli:v7.9.0 generate -i http://host.docker.internal:3000/explorer-json -g typescript-angular -o local/@scicatproject/scicat-sdk-ts --additional-properties=ngVersion=16.2.12,npmName=@scicatproject/scicat-sdk-ts,supportsES6=true,npmVersion=10.8.2,withInterfaces=true --skip-validate-spec`,
    { encoding: "utf-8" },
  );
  console.log(generationOutput);

  console.log("Installing dependencies and building the sdk...");
  const installBuildOutput = execSync(
    "cd @scicatproject/scicat-sdk-ts && npm install && npm run build",
    { encoding: "utf-8" },
  );
  console.log(installBuildOutput);

  console.log("Copying the build files in node_modules...");
  const copyToNodeModulesOutput = execSync(
    "cp -r @scicatproject/scicat-sdk-ts/dist node_modules/@scicatproject/scicat-sdk-ts",
    { encoding: "utf-8" },
  );
  console.log(copyToNodeModulesOutput);

  console.log("Final cleanup...");
  execSync("rm -rf @scicatproject", {
    encoding: "utf-8",
  });

  console.log("Local SDK generation completed");
} else {
  console.log("Your environment is a linux/unix");
  console.log("Please run the following command on your terminal:");
  console.log("> sudo -E ./scripts/generate-nestjs-sdk.bash");
  console.log("");
  console.log(
    "IMPORTANT: the script runs under sudo. You will be asked your password.",
  );
  console.log("");
}
