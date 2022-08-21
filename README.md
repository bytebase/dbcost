# DB Cost

[dbcost.com](https://dbcost.com) the Ultimate AWS RDS and Google Cloud SQL instance pricing comparison sheet.

## Background

The market lacks a tool for developers to compare different database products before making a final decision. A site, where all available RDS's performance and cost can be demonstrated, is highly wanted.

## Tech Stack (at least this is expected)

### Used

- **Golang**.
- **Nuxt3** with **Vite**.
- **ApexCharts** for visualization.
- **Terraform** for infra management.
- **Profilers** such as tpcc.
- **Docker** for image packaging (Backend, Terraform, profilers).
- **Cron** task by **Render**.
- **JSON-Schema** for schema （ideally, the whole project's data would be stored as json files）

### Requirement

- [Go v1.7](https://go.dev/dl/)
- [pnpm](https://pnpm.io) for package management

## Road Map

- [ ] Data collector
  - [x] AWS
  - [x] GCP
  - [ ] ALIYUN ( Low priority )
- [ ] Cost Table
  - [x] Basic Table
  - [x] Data Refinement Menu
  - [x] Table for checked Instance
  - [ ] RAM / CPU wise calculator special for GCP
- [x] Cost Charts
  - [x] Compare the difference in monthly price between different offers ( Line Chart )
  - [x] Compare the difference in total price between different offers ( Stacked Columns Chart )
  - [x] Compare the spec(cpu, ram) and cost of different instances ( Bubble Chart )
  - [x] Comparison page
- [x] SEO with **Nuxt3**
- [ ] Maintaining Relevant Services
  - [ ] Incorporate Terraform
  - [ ] Database Service Life Cycle Management
- [ ] Database Benchmark
  - [ ] Benchmark Test Scheduling / Result Storage
  - [ ] Benchmark Dashboard

## How to start?

This project is under development and is very unstable. The way to start this project may improve as process goes on.

### Fetching Data

We maintain our data through a GitHub Actions CronJob. It runs every day to make sure the pricing data is up to date. The data on dbcost.com is provided at [here](https://github.com/bytebase/dbcost/blob/main/data/dbInstance.json).

### Installing Frontend Dependencies

```
cd ./frontend && pnpm i --shamefully-hoist
```

### Starting the Frontend

```
pnpm dev
```

Now dbcost is available at [localhost:3000](localhost:3000)

### Seeding data manually

If you would like to fetch the latest data manually, please apply for a [GCP API KEY](https://cloud.google.com/apigee/docs/api-platform/security/api-keys) with access to the [Cloud Billing API](https://cloud.google.com/billing/docs/reference/rest) first. For AWS, the API is open to everyone, you do not need a API KEY to access relevant resource.

First set environment variable:

```
export API_KEY_GCP={YOUR_API_KEY}
```

Then run the following command:

```
go run ./seed/main/go
```
