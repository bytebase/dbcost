-- Type
CREATE TYPE row_status AS ENUM ('NORMAL', 'ARCHIVED');

-- contributor
-- we may allow random user to perform benchmark test via our platform,
-- and we can collect their data to make our dashboard more convincing
CREATE TABLE contributor (
    -- 0 is reserverd for system bot
    id SERIAL PRIMARY KEY,
    row_status row_status NOT NULL DEFAULT 'NORMAL',
    created_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    updated_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    name TEXT NOT NULL,
);

-- cloud provider
CREATE TABLE cloud_provider (
    id SERIAL PRIMARY KEY,
    row_status row_status NOT NULL DEFAULT 'NORMAL',
    creator_id INTEGER NOT NULL REFERENCES contributor (id),
    created_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    updater_id INTEGER NOT NULL REFERENCES contributor (id),
    updated_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    name TEXT NOT NULL,
);

CREATE TABLE region (
    id SERIAL PRIMARY KEY,
    row_status row_status NOT NULL DEFAULT 'NORMAL',
    creator_id INTEGER NOT NULL REFERENCES contributor (id),
    created_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    updater_id INTEGER NOT NULL REFERENCES contributor (id),
    updated_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    -- allowed location are: eu(europe), ap(asia-pacific), us(us) (for those region are the most used by developers)
    location TEXT NOT NULL (type IN ('eu', 'ap', 'us')),
);

-- maybe splic the price related field in TABLE profuct to TABLE term ?
CREATE TABLE term (
    id SERIAL PRIMARY KEY,
    external_id TEXT NOT NULL,
    row_status row_status NOT NULL DEFAULT 'NORMAL',
    creator_id INTEGER NOT NULL REFERENCES contributor (id),
    created_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    updater_id INTEGER NOT NULL REFERENCES contributor (id),
    updated_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    charge_type TEXT NOT NULL (type in ('OnDemand', 'Reserved')),
    length TEXT NOT NULL (type in ('hr', '1yr', '2yr', '3yr')),
    price_usd INTEGER NOT NULL
);

-- Product 
-- AWS and GCP are very different in term of their RDS product
-- AWS(also aliyun) has coupious instances with different specification to let user choose from
-- GCP provides great flexibility that allows user to customize their RDS's spec
CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    external_id TEXT NOT NULL,
    row_status row_status NOT NULL DEFAULT 'NORMAL',
    creator_id INTEGER NOT NULL REFERENCES contributor (id),
    created_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    updater_id INTEGER NOT NULL REFERENCES contributor (id),
    updated_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    cloud_provider_id INTEGER NOT NULL REFERENCES cloud_provider(id),
    region_id INTEGER NOT NULL REFERENCES region(id),
    -- 
    family TEXT NOT NULL (type in ('GeneralPurpose', 'MemoryOptimized')),
    name TEXT NOT NULL,
    price_usd INTEGER NOT NULL,
    engine TEXT NOT NULL (type IN ('MySQL', 'PostgreSQL')),
    vcpu INTEGER NOT NULL,
    memory INTEGER NOT NULL,
    processor TEXT NOT NULL,
    -- this field this very tricky for different vendors have different way representation
    storage TEXT NOT NULL
);

-- benchmark store the relevant benchmark test for DB
CREATE TABLE benchmark(
    id SERIAL PRIMARY KEY,
    row_status row_status NOT NULL DEFAULT 'NORMAL',
    creator_id INTEGER NOT NULL REFERENCES contributor (id),
    created_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    updater_id INTEGER NOT NULL REFERENCES contributor (id),
    updated_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    name TEXT NOT NULL,
);

-- task store the task 
CREATE TABLE task(
    id SERIAL PRIMARY KEY,
    row_status row_status NOT NULL DEFAULT 'NORMAL',
    row_status row_status NOT NULL DEFAULT 'NORMAL',
    creator_id INTEGER NOT NULL REFERENCES contributor (id),
    created_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    updater_id INTEGER NOT NULL REFERENCES contributor (id),
    updated_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    product_id INTEGER NOT NULL REFERENCES product (id),
    benchmark__id INTEGER NOT NULL REFERENCES benchmark (id),
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN (
            'PENDING',
            'RUNNING',
            'DONE',
            'FAILED',
            'CANCELED'
        )
    ),
);

-- task run table stores the task run
CREATE TABLE task_run(
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES contributor (id),
    created_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    updater_id INTEGER NOT NULL REFERENCES contributor (id),
    updated_ts BIGINT NOT NULL DEFAULT extract(
        epoch
        from
            now()
    ),
    task_id INTEGER NOT NULL REFERENCES task (id),
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('RUNNING', 'DONE', 'FAILED', 'CANCELED')
    ),
    comment TEXT NOT NULL DEFAULT '',
    -- result saves the task run result in json format
    result JSONB NOT NULL DEFAULT '{}',
    payload JSONB NOT NULL DEFAULT '{}'
);