export default async (model: any, page: number, query: object[], id?: object) => {
  try {
    id = !id ? {} : id;
    const limit = 10; // TODO
    const startIndex = limit * (page - 1);
    const totalDocs = await model.countDocuments(id).exec();
    const totalPages = Math.floor(totalDocs / limit) + 1;
    const docs = await model
      .find()
      .and(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const result = {
      docs,
      limit,
      totalDocs,
      page,
      totalPages,
    };
    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error);
  }
};
