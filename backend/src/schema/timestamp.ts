import { interfaceType } from "@nexus/schema";

export const Timestamp = interfaceType({
  name: "Timestamp",
  definition(t) {
    t.string("createdAt", { description: "Date will be in ISO Format" });
    t.string("updatedAt", { description: "Date will be in ISO Format" });
    t.resolveType(() => null);
  },
});
