# DB Cost

[dbcost.com](https://dbcost.com) the simple pricing calculator and comparison tool for the Cloud databases.

## Roadmap

- [ ] Supported Cloud Vendors
  - [x] AWS RDS
  - [x] GCP Cloud SQL
  - [ ] Azure
  - [ ] AliCloud
- [ ] Cost Table
  - [x] Basic Table
  - [x] Data Refinement Menu
  - [ ] Table for checked Instance
  - [ ] RAM / CPU wise calculator special for GCP
- [ ] Cost Charts
  - [x] Compare the difference in monthly price between different offers ( Line Chart )
  - [ ] Compare the difference in total price between different offers ( Stacked Columns Chart )
  - [ ] Comparison page
- [ ] SEO with **Next**
  - [x] Semantic URLs
  - [x] Related instances/regions references
- [ ] Maintaining Relevant Services
  - [ ] Incorporate Terraform
  - [ ] Database Service Life Cycle Management
- [ ] Database Benchmark
  - [ ] Benchmark Test Scheduling / Result Storage
  - [ ] Benchmark Dashboard

## Background

The market lacks a tool for developers to compare different database products before making a final decision. A site, where all available cloud providers' database performance and cost can be demonstrated, is desired.

## Tech Stack (at least this is expected)

### Used

<img src="https://user-images.githubusercontent.com/56376387/198507390-358bf549-cc8f-4c57-946d-1ba38ea79fdc.svg" width="400" align="right"></img>

- **Golang**.
- **Next.js** with **React 18**.
- **Ant Design** as component library.
- **Nivo** for chart visualization.
- **Cron** task by **GitHub Actions**.

### Requirement

- [Go v1.7](https://go.dev/dl/)
- [pnpm](https://pnpm.io) for package management

## How to start?

This project is under development and is very unstable. The way to start this project may improve as process goes on.

### Fetching Data

We maintain our data through a GitHub Actions CronJob. It runs every day to make sure the pricing data is up to date. The data on dbcost.com is provided at [here](https://github.com/bytebase/dbcost/blob/main/data/dbInstance.json).

### Installing Frontend Dependencies

```
cd ./frontend && pnpm install
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
