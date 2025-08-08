export const users = [
  {
    id: "1",
    username: "admin",
    role: "admin",
    name: "Admin",
    email: "admin@patchme.local",
    password: "admin123"
  },
  {
    id: "2",
    username: "demo",
    role: "user",
    name: "Demo User",
    email: "user@patchme.local",
    password: "demo123"
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
  { id: "1", name: "PHP", variable: "PHP_Version", minVersion: "8.3" },
  { id: "2", name: "MariaDB", variable: "MariaDB_Version", minVersion: "10.11" },
  { id: "3", name: "Nextcloud", variable: "NC_Version", minVersion: "29.0" },
  { id: "4", name: "PostgreSQL", variable: "PostgreSQL_Version", minVersion: "15.0" },
  { id: "5", name: "Apache", variable: "Apache_Version", minVersion: "2.4.54" },
  { id: "6", name: "Nginx", variable: "Nginx_Version", minVersion: "1.23.3" },
  { id: "7", name: "Redis", variable: "Redis_Version", minVersion: "7.0.0" },
  { id: "8", name: "Memcached", variable: "Memcached_Version", minVersion: "1.6.9" },
  { id: "9", name: "MongoDB", variable: "MongoDB_Version", minVersion: "6.0.0" },
  { id: "10", name: "Cassandra", variable: "Cassandra_Version", minVersion: "4.0.0" }
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
    timestamp: new Date().toISOString(),
    entries: [
      { name: "PHP_Version", value: "8.3.0" },
      { name: "MariaDB_Version", value: "10.11.2" },
      { name: "NC_Version", value: "29.0.1" }
    ]
  },
  {
    id: "2",
    systemId: "2",
    systemName: "Plesk",
    timestamp: new Date().toISOString(),
    entries: [
      { name: "PHP_Version", value: "8.3.0" },
      { name: "MariaDB_Version", value: "10.11.2" }
    ]
  }
];