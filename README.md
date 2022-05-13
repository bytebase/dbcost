# DB Cost

## Background
The market lacks a tool for developers to compare different database products before making a final decision. A site, where all available RDS's performance and cost can be demonstrated, is highly wanted.

## Tech Stack (at least this is expected)

+ **Golang** in Backend
+ **Vue** in Frontend.
+ **Terraform** for infra management.
+ **Profilers** such as tpcc.
+ **Docker** for image packaging (Backend, Terraform, profilers).
+ **Cron** task  by **Render**.
+ **JSON-Schema** for schema （ideally, the whole project's data would be stored as json files）

### Requirement  
+ [Go v1.7](https://go.dev/dl/)
+ [pnpm](https://pnpm.io) for package management

## Road Map
* [ ] Data collector
  * [x] AWS
  * [x] GCP 
  * [ ] ALIYUN ( Low priority )
* [ ] Cost Table
  * [x] Basic Table
  * [x] Data Refinement Menu
  * [x] Table for checked Instance
  * [ ] RAM / CPU wise calculator special for GCP
* [ ] SEO (**On Going**) 
* [ ] Maintaining Relevant Services
  * [ ] Incorporate Terraform
  * [ ] Database Service Life Cycle Management
* [ ] Database Benchmark
  * [ ] Benchmark Test Scheduling / Result Storage
  * [ ] Benchmark Dashboard
## How to start?

This project is under development and is very unstable. The way to start this project may improve as process goes on.

### Fetching Data
Sample data is provided at [here](https://github.com/bytebase/dbcost/blob/main/store/data/sample.json). Your may start dbcost in sample mode, without fetching your own data. If you decide to start with sample data, just skip this step.

Or, if you would like to fetch the newest data online, please apply for a [GCP API KEY](https://cloud.google.com/apigee/docs/api-platform/security/api-keys?hl=en&_ga=2.248673159.1879775959.1652425553-1923221278.1651636210&_gac=1.19919946.1652425553.Cj0KCQjwg_iTBhDrARIsAD3Ib5jxpCArIqLqlXF61hULy8r46r2GwzWKde-4nLdzetVquoP6ed1R_QsaAjXVEALw_wcB) with access to the [Cloud Billing API](https://cloud.google.com/billing/docs/reference/rest) yourself first. 

#### Set environment variable

```
export API_KEY_GCP={YOUR_API_KEY}
```
#### Seeding data
```
go run ./seed/main/go
```

### Installing Frontend Dependencies
```
cd ./frontend && pnpm i
```
### Starting the Frontend
#### With sample data
```
pnpm sample
```
#### With your own data
```
pnpm dev
```

Now dbcost is available at [localhost:3000](localhost:3000)
