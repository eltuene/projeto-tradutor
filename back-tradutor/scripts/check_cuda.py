import torch

# Verifica se CUDA está disponível
cuda_available = torch.cuda.is_available()

print("CUDA disponível:", cuda_available)

# Se CUDA está disponível, exibe o nome da GPU
if cuda_available:
    print("Nome da GPU:", torch.cuda.get_device_name(0))