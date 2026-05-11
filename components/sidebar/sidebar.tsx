import { prismaClient } from '@/lib/prisma';
import { SidebarContent } from './sidebar-content';

async function Sidebar() {
  const prompts = await prismaClient.prompt.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return <SidebarContent prompts={prompts} />;
}

export { Sidebar };
