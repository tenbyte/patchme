export const users = [
  {
    id: "1",
    role: "admin",
    name: "Admin",
    email: "admin@patchme.local",
    password: "$2b$10$.Eg6WciaA2ML2Fs4XgyW7.yLOtugBdYvgLBC8f1zKUjt9Qy0.Inz6"
  },
  {
    id: "2",
    role: "user",
    name: "Demo User",
    email: "user@patchme.local",
    password: "$2b$10$A0qeTBz40j0xCEoBMwPbreiVixFh5vamqpdxI8AJBKdBasKP/OaMq"
  }
];

export const demoTags = [
  { id: "1", name: "prod" },
  { id: "2", name: "staging" },
  { id: "3", name: "test" },
  { id: "4", name: "eu-central" },
  { id: "5", name: "legacy" },
];

export const demoBaselines = [
  { id: "1", name: "PHP", variable: "PHP_Version", type: "MIN", minVersion: "8.3" },
  { id: "2", name: "MariaDB", variable: "MariaDB_Version", type: "MIN", minVersion: "10.11" },
  { id: "3", name: "Nextcloud", variable: "NC_Version", type: "MIN", minVersion: "29.0" },
  { id: "4", name: "PostgreSQL", variable: "PostgreSQL_Version", type: "MIN", minVersion: "15.0" },
  { id: "5", name: "Apache", variable: "Apache_Version", type: "MIN", minVersion: "2.4.54" },
  { id: "6", name: "Nginx", variable: "Nginx_Version", type: "MIN", minVersion: "1.23.3" },
  { id: "7", name: "Redis", variable: "Redis_Version", type: "MIN", minVersion: "7.0.0" },
  { id: "8", name: "Memcached", variable: "Memcached_Version", type: "MIN", minVersion: "1.6.9" },
  { id: "9", name: "MongoDB", variable: "MongoDB_Version", type: "MIN", minVersion: "6.0.0" },
  { id: "10", name: "Cassandra", variable: "Cassandra_Version", type: "MIN", minVersion: "4.0.0" }
];

export const demoSystems = [
  {
    id: "1",
    name: "Nextcloud",
    hostname: "https://cloud.acme.com",
    tags: ["1", "4"], // prod, eu-central
    apiKey: "pm_DEMO1",
    lastSeen: new Date().toISOString(),
    baselines: ["1", "2", "3"],
  },
  {
    id: "2",
    name: "Plesk",
    hostname: "https://panel.acme.com",
    tags: ["1"], // prod
    apiKey: "pm_DEMO2",
    lastSeen: new Date().toISOString(),
    baselines: ["1", "2"],
  },
  {
    id: "3",
    name: "Linux",
    hostname: "https://srv01.acme.com",
    tags: ["2"], // staging
    apiKey: "pm_DEMO3",
    lastSeen: new Date().toISOString(),
    baselines: ["2"],
  },
]

export const demoActivity = [
  {
    id: "1",
    systemId: "1",
    systemName: "Nextcloud",
    createdAt: new Date().toISOString(),
    meta: {
      versions: [
        { variable: "PHP_Version", version: "8.3.0" },
        { variable: "MariaDB_Version", version: "10.11.2" },
        { variable: "NC_Version", version: "29.0.1" }
      ]
    }
  },
  {
    id: "2",
    systemId: "2",
    systemName: "Plesk",
    createdAt: new Date().toISOString(),
    meta: {
      versions: [
        { variable: "PHP_Version", version: "8.3.0" },
        { variable: "MariaDB_Version", version: "10.11.2" }
      ]
    }
  }
];


export const demoSystemBaselineValues = [
  // Nextcloud
  { id: "sbv1", systemId: "1", baselineId: "1", value: "8.3.0" }, // PHP
  { id: "sbv2", systemId: "1", baselineId: "2", value: "10.11.2" }, // MariaDB
  { id: "sbv3", systemId: "1", baselineId: "3", value: "29.0.1" }, // NC
  // Plesk
  { id: "sbv4", systemId: "2", baselineId: "1", value: "8.2.0" }, // PHP
  { id: "sbv5", systemId: "2", baselineId: "2", value: "10.11.1" }, // MariaDB
  // Linux
  { id: "sbv6", systemId: "3", baselineId: "2", value: "10.11.0" }, // MariaDB
]