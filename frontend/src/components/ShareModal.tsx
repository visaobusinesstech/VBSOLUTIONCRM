import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Ícones das redes sociais
const InstagramIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068c0-3.518.85-6.372 2.495-8.423C5.845 1.205 8.598.024 12.179 0h.007c3.581.024 6.334 1.205 8.184 3.509C22.65 5.56 23.5 8.414 23.5 11.932c0 3.518-.85 6.372-2.495 8.423C18.155 21.795 15.402 22.976 11.821 24zM12.179 2.25c-2.895.02-5.091.935-6.507 2.677C4.266 6.636 3.75 9.064 3.75 11.932c0 2.868.516 5.296 1.922 7.005 1.416 1.742 3.612 2.657 6.507 2.677 2.895-.02 5.091-.935 6.507-2.677 1.406-1.709 1.922-4.137 1.922-7.005 0-2.868-.516-5.296-1.922-7.005C17.27 3.185 15.074 2.27 12.179 2.25z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postContent: string;
  postUrl?: string;
}

const ShareModal = ({ isOpen, onClose, postContent, postUrl }: ShareModalProps) => {
  const currentUrl = postUrl || window.location.href;
  const shareText = `Confira esta publicação: ${postContent}`;

  const shareToSocial = (platform: string, url: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(shareText);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'instagram':
        // Instagram não tem API de compartilhamento direto, então copia o texto
        copyToClipboard(shareText);
        toast({
          title: "Instagram",
          description: "Texto copiado! Cole no Instagram Stories ou posts.",
        });
        return;
        
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
        
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
        
      case 'threads':
        // Threads não tem API de compartilhamento direto, então copia o texto
        copyToClipboard(shareText);
        toast({
          title: "Threads",
          description: "Texto copiado! Cole no Threads.",
        });
        return;
        
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
        
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Link copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const socialPlatforms = [
    {
      name: 'Instagram',
      icon: <InstagramIcon />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600',
      action: () => shareToSocial('instagram', currentUrl)
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      action: () => shareToSocial('facebook', currentUrl)
    },
    {
      name: 'X (Twitter)',
      icon: <XIcon />,
      color: 'bg-gray-900',
      hoverColor: 'hover:bg-gray-800',
      action: () => shareToSocial('x', currentUrl)
    },
    {
      name: 'Threads',
      icon: <ThreadsIcon />,
      color: 'bg-gray-800',
      hoverColor: 'hover:bg-gray-700',
      action: () => shareToSocial('threads', currentUrl)
    },
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      action: () => shareToSocial('whatsapp', currentUrl)
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Compartilhar Publicação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview do conteúdo */}
          <Card className="p-4 bg-gray-50">
            <p className="text-sm text-gray-700 line-clamp-3">{postContent}</p>
          </Card>
          
          {/* Botões das redes sociais */}
          <div className="grid grid-cols-1 gap-3">
            {socialPlatforms.map((platform) => (
              <Button
                key={platform.name}
                onClick={platform.action}
                className={`w-full justify-start gap-3 h-12 text-white ${platform.color} ${platform.hoverColor} transition-all duration-200`}
              >
                {platform.icon}
                <span className="font-medium">Compartilhar no {platform.name}</span>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
            ))}
          </div>
          
          {/* Copiar link */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(currentUrl)}
              className="w-full justify-center gap-2 h-10"
            >
              <Copy className="h-4 w-4" />
              Copiar Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
