
module.exports = {
    apps : [{
        name: 'objects-bot',
        script: './bin/service.js',
        
        instances: 1,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_PATH:'.',
            NODE_ENV: 'production'
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: '8083',
            API_KEY: '5456u56y4grt45g4g45g3yh5ghr56g',
            ACC_DATA:'[{"name":"dw38h","postingKey":"fghfgh56yh5hrbgr5g4"}]',
            APP_NAME: 'waivio',
            PROXYBOT_ACC_DATA: '[{"name":"suy38","postingKey":"fghfhfgh56y5hrthgrtgr45"}]'
        }
    }],

};

