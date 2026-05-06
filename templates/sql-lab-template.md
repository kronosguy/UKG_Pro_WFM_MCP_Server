# SQL Lab [Number]: [Lab Title]

## Lab Objective

[Describe the analytics engineering outcome.]

## Scenario

[Describe the workforce analytics scenario.]

## Data Model

| Table | Grain | Purpose |
| --- | --- | --- |
| [Table] | [Grain] | [Purpose] |

## Business Rules

- [Rule]
- [Rule]
- [Rule]

## Query Requirements

- [Requirement]
- [Requirement]
- [Requirement]

## Example Query Pattern

```sql
select
    [dimension],
    count(*) as record_count
from [dataset].[table]
group by [dimension];
```

## Data Quality Checks

| Check | Expected Result |
| --- | --- |
| null key check | no missing required keys |
| duplicate grain check | one row per defined grain |
| date range check | records fall within expected reporting period |

## Performance Considerations

- partition filters
- clustered dimensions
- selected columns only
- aggregation grain
- cost monitoring

## Expected Output

- [Output]
- [Output]

## Portfolio Deliverable

[Describe the SQL model, quality check, or reporting dataset produced.]

