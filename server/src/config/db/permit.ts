const status = {
  deleted: 1,
  inactive: 2,
  active: 4,
  cancelled: 8
};

const groups = {
  root: 1,
  manager:2,
  user: 4,
  other: 8
};

const permits = {
  owner_read: 256,
  owner_write: 128,
  owner_delete: 64,
  group_read: 32,
  group_write: 16,
  group_delete: 8,
  other_read: 4,
  other_write: 2,
  other_delete: 1
};

const permitOnTable = (id:number, group:number, table:string) => {
  const _q = `
    select ac._title as actions
    from _action as ac
    left outer join privilege as pr
    on pr.relatedTable = '${table}'
        and pr.action = ac._title
        and pr.type = 'table'
    where
        (ac._applyObject = 0) and (
        (${group} & ${groups.root} != 0)
        or (pr.role = 'user' and pr.who = ${id})
        or (pr.role = 'group' and (pr.who & ${group} != 0)))
    `;
  return _q;
};

const permitOnRow = (id:number, group:number, table:string) => {
  let _q = `
  select distinct ac._title as actions
  from
    _action as ac
    inner join ${table} as obj on obj.id = ${id}
    inner join _implementedAction as ia
        on ia._action = ac._title
          and ia._table = '${table}'
          and ((ia._status = 0) or (ia._status & obj._status != 0))
    left outer join privilege as pr
        on pr.relatedTable = '${table}'
          and pr.action = ac._title
          and (
              (pr.type = 'object' and pr.relatedId = ${id})
              or pr.type = 'global'
              or (pr.role = 'self' and '${table}' = 'secret'))
  where
    ac._applyObject = 1
    and (
        (${group} & ${groups.root} != 0)
        or (ac._title = 'read' and (
          (obj._perms & ${permits.other_read} != 0)
          or ((obj._perms & ${permits.owner_read} != 0)
              and obj._owner = ${id})
          or ((obj._perms & ${permits.group_read} != 0)
              and (${group} & obj._group != 0))))
        or (ac._title = 'write' and (
          (obj._perms & ${permits.other_write} != 0)
          or ((obj._perms & ${permits.owner_write} != 0)
              and obj._owner = ${id})
          or ((obj._perms & ${permits.group_write} != 0)
              and (${group} & obj._group != 0))))
        or (ac._title = 'delete' and (
          (obj._perms & ${permits.other_delete} != 0)
          or ((obj._perms & ${permits.owner_delete} != 0)
              and obj._owner = ${id})
          or ((obj._perms & ${permits.group_delete} != 0)
              and (${group} & obj._group != 0))))

        or (pr.role = 'user' and pr.who = ${id})
        or (pr.role = 'owner' and obj._owner = ${id})
        or (pr.role = 'owner_group' and (obj._group & ${group} != 0))
        or (pr.role = 'group' and (pr.who & ${group} != 0)))
        or pr.role = 'self'`;
  return _q;
};

export const permitQuery = {
  onRow: permitOnRow,
  onTable: permitOnTable
}
