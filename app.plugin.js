const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to:
 * 1. Add PACKAGE_USAGE_STATS permission to AndroidManifest.xml
 * 2. Copy native module files to android project during prebuild
 * 3. Modify MainApplication.kt to register the ScreenTimePackage
 */
const withScreenTimePermissions = (config) => {
  // Add permission to AndroidManifest
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    // Add PACKAGE_USAGE_STATS permission
    const permissions = manifest['uses-permission'];
    const hasUsageStatsPermission = permissions.some(
      (perm) => perm.$['android:name'] === 'android.permission.PACKAGE_USAGE_STATS'
    );

    if (!hasUsageStatsPermission) {
      permissions.push({
        $: {
          'android:name': 'android.permission.PACKAGE_USAGE_STATS',
        },
      });
    }

    return config;
  });

  // Copy native module files and modify MainApplication.kt
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;
      const projectSourceRoot = config.modRequest.projectRoot;
      
      // Copy native module files
      const sourceDir = path.join(projectSourceRoot, 'modules', 'expo-screen-time', 'android', 'src', 'main', 'java', 'com', 'hydrosleep', 'tracker', 'screentime');
      const targetDir = path.join(projectRoot, 'app', 'src', 'main', 'java', 'com', 'hydrosleep', 'tracker', 'screentime');

      if (fs.existsSync(sourceDir)) {
        // Create target directory if it doesn't exist
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Copy all Kotlin files
        const files = fs.readdirSync(sourceDir);
        files.forEach((file) => {
          if (file.endsWith('.kt')) {
            const sourceFile = path.join(sourceDir, file);
            const targetFile = path.join(targetDir, file);
            fs.copyFileSync(sourceFile, targetFile);
            console.log(`[ScreenTime Plugin] Copied ${file} to android project`);
          }
        });
      } else {
        console.warn(`[ScreenTime Plugin] Warning: Native module source directory not found: ${sourceDir}`);
      }

      // Modify MainApplication.kt to register the package
      const mainApplicationPath = path.join(projectRoot, 'app', 'src', 'main', 'java', 'com', 'hydrosleep', 'tracker', 'MainApplication.kt');
      
      if (fs.existsSync(mainApplicationPath)) {
        let mainApplicationContent = fs.readFileSync(mainApplicationPath, 'utf8');
        
        // Check if import already exists
        if (!mainApplicationContent.includes('import com.hydrosleep.tracker.screentime.ScreenTimePackage')) {
          // Add import after other imports
          const importMatch = mainApplicationContent.match(/import expo\.modules\.ReactNativeHostWrapper\n/);
          if (importMatch) {
            mainApplicationContent = mainApplicationContent.replace(
              'import expo.modules.ReactNativeHostWrapper\n',
              'import expo.modules.ReactNativeHostWrapper\nimport com.hydrosleep.tracker.screentime.ScreenTimePackage\n'
            );
            console.log('[ScreenTime Plugin] Added ScreenTimePackage import');
          }
        }
        
        // Check if package is already registered
        if (!mainApplicationContent.includes('add(ScreenTimePackage())')) {
          // Find the getPackages method and add the package
          const packagesMatch = mainApplicationContent.match(/(PackageList\(this\)\.packages\.apply \{[^}]*)(\})/s);
          if (packagesMatch) {
            const beforeApply = packagesMatch[1];
            const afterApply = packagesMatch[2];
            
            // Add the package registration before the closing brace
            const newApplyBlock = beforeApply + 
              '\n              add(ScreenTimePackage())\n            ' + 
              afterApply;
            
            mainApplicationContent = mainApplicationContent.replace(
              packagesMatch[0],
              newApplyBlock
            );
            console.log('[ScreenTime Plugin] Added ScreenTimePackage registration');
          }
        }
        
        fs.writeFileSync(mainApplicationPath, mainApplicationContent, 'utf8');
      } else {
        console.warn(`[ScreenTime Plugin] Warning: MainApplication.kt not found at ${mainApplicationPath}`);
      }

      return config;
    },
  ]);

  return config;
};

module.exports = withScreenTimePermissions;
