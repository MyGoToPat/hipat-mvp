import ChatPane from '@/components/ChatPane'

export default function Chat() {
  // For this simple implementation, we're passing null as the agentId
  // In a real implementation, this would come from state or props
  return (
    <section className="flex flex-col h-full bg-gray-50 rounded">
      <ChatPane agentId={null} />
    </section>
  );
}