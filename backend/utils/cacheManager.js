/**
 * Cache Management Utility for Node.js Module Cache Busting
 * Resolves persistent middleware caching issues in development
 */

/**
 * Recursively purges a module and all its children from require.cache
 * @param {string} moduleName - The module name or path to purge
 */
function purgeCache(moduleName) {
  const searchCache = (mod, callback) => {
    if (mod.children) {
      mod.children.forEach(child => {
        searchCache(child, callback);
      });
    }
    callback(mod);
  };

  try {
    const resolved = require.resolve(moduleName);
    if (require.cache[resolved]) {
      console.log(`🧹 Purging cache for module: ${moduleName}`);
      
      // Recursively delete the module and its children
      searchCache(require.cache[resolved], (mod) => {
        delete require.cache[mod.id];
      });
      
      // Also clear internal path cache
      if (module.constructor._pathCache) {
        Object.keys(module.constructor._pathCache)
          .filter(key => key.includes(moduleName))
          .forEach(key => {
            delete module.constructor._pathCache[key];
            console.log(`🧹 Cleared path cache for: ${key}`);
          });
      }
      
      console.log(`✅ Successfully purged cache for: ${moduleName}`);
    }
  } catch (error) {
    console.warn(`⚠️ Could not purge cache for ${moduleName}:`, error.message);
  }
}

/**
 * Purges all authentication middleware modules from cache
 * Specifically targets the problematic middleware files
 */
function purgeAuthMiddlewareCache() {
  console.log('🔄 Purging authentication middleware cache...');
  
  const path = require('path');
  const backendDir = path.resolve(__dirname, '..');
  
  const middlewareModules = [
    path.join(backendDir, 'middleware/auth/routeProtection.js'),
    path.join(backendDir, 'middleware/auth/roleExtraction.js'),
    path.join(backendDir, 'middleware/auth/jwtValidation.js'),
    path.join(backendDir, 'middleware/auth/index.js')
  ];
  
  middlewareModules.forEach(moduleName => {
    purgeCache(moduleName);
  });
  
  console.log('✅ Authentication middleware cache purge complete');
}

/**
 * Purges cache for all route modules to ensure fresh loading
 */
function purgeRouteCache() {
  console.log('🔄 Purging route cache...');
  
  const path = require('path');
  const backendDir = path.resolve(__dirname, '..');
  
  const routeModules = [
    path.join(backendDir, 'routes/scheduleRoutes.js'),
    path.join(backendDir, 'routes/authRoutes.js'),
    path.join(backendDir, 'routes/userRoutes.js'),
    path.join(backendDir, 'routes/clinicianRoutes.js')
  ];
  
  routeModules.forEach(moduleName => {
    purgeCache(moduleName);
  });
  
  console.log('✅ Route cache purge complete');
}

/**
 * Comprehensive cache purge for development environment
 * Clears all potentially problematic cached modules
 */
function purgeAllDevelopmentCache() {
  console.log('🧹 Starting comprehensive development cache purge...');
  
  purgeAuthMiddlewareCache();
  purgeRouteCache();
  
  console.log('✅ Comprehensive cache purge complete');
}

/**
 * Sets up file watchers for automatic cache invalidation in development
 * @param {Array} watchPaths - Array of file paths to watch
 */
function setupDevelopmentWatchers(watchPaths = []) {
  if (process.env.NODE_ENV === 'production') {
    console.log('🚫 Skipping file watchers in production environment');
    return;
  }
  
  const fs = require('fs');
  const path = require('path');
  
  const defaultWatchPaths = [
    './middleware/auth/routeProtection.js',
    './middleware/auth/roleExtraction.js',
    './middleware/auth/jwtValidation.js'
  ];
  
  const pathsToWatch = watchPaths.length > 0 ? watchPaths : defaultWatchPaths;
  
  pathsToWatch.forEach(filePath => {
    try {
      const fullPath = path.resolve(__dirname, '..', filePath);
      fs.watch(fullPath, (eventType, filename) => {
        if (eventType === 'change') {
          console.log(`📁 File changed: ${filename}, purging cache...`);
          purgeCache(fullPath);
        }
      });
      console.log(`👀 Watching for changes: ${filePath}`);
    } catch (error) {
      console.warn(`⚠️ Could not set up watcher for ${filePath}:`, error.message);
    }
  });
}

module.exports = {
  purgeCache,
  purgeAuthMiddlewareCache,
  purgeRouteCache,
  purgeAllDevelopmentCache,
  setupDevelopmentWatchers
};