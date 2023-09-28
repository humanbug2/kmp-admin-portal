import prisma from "@/lib/prisma";

export default async function handle(req: any, res: any) {
  try {
    const userData = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return res.status(200).json(userData);
  } catch (e) {
    console.error(e);
    return "Error";
  }
}
