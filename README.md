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
  * [ ] GCP (**On Going**)
  * [ ] ALIYUN
* [ ] Cost Table
  * [x] Basic Table
  * [ ] Data Refinement Menu (**On Going**)
* [ ] Maintaining Relevant Services
  * [ ] Incorporate Terraform
  * [ ] Database Service Life Cycle Management
* [ ] Database Benchmark
  * [ ] Benchmark Test Scheduling / Result Storage
  * [ ] Benchmark Dashboard
## How to start?

This project is under development and is very unstable. The way to start this project may improve as process goes on.

### Installing Frontend Dependencies
```
cd ./frontend && pnpm i
```

### Fetching Data

A sample data is provided at [here](https://github.com/bytebase/dbcost/blob/main/store/data/test/aws-sample.json), you may not need to download and scrub the data by yourself.

**(NOT REQUIRED)** If you would like to fetch the newest data online, a unit test is provided to do this thing for now. You may type in the following script to your terminal.
```
go test -timeout 60s -run ^Test_SaveToLocal$ github.com/bytebase/dbcost/store -v
```

### Starting the Frontend
```
pnpm dev
```

Now the project would be available at [localhost:3000](localhost:3000)