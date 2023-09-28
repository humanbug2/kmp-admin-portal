import prisma from "@/lib/prisma";

export default async function handle(req: any, res: any) {
  try {
    const { file, users } = await req.body;
    const task = await prisma.tasks.create({
      data: {
        Task_Name: file.slice(0, -4),
        Table_Name: file.slice(0, -4),
        Members: users,
      },
    });
    return res.status(200).json({ message: "success" });
  } catch (e) {
    console.error(e);
    return res.json({ message: "Error" });
  }
}
