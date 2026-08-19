# Kubernetes manifests

Deploys the invoice app (web + queue worker, both from the same image) and a MySQL
StatefulSet into their own `invoices` namespace.

```
k8s/
├── 00-namespace.yaml
├── app/
│   ├── configmap.yaml     # non-secret app config
│   ├── secret.yaml        # APP_KEY, DB_USERNAME, DB_PASSWORD
│   ├── deployment.yaml    # web role (args: ["web"]), 2 replicas
│   └── service.yaml       # ClusterIP :80
├── worker/
│   └── deployment.yaml    # same image, worker role (args: ["worker"]), 1 replica
├── db/
│   ├── configmap.yaml     # MYSQL_DATABASE
│   ├── secret.yaml        # MYSQL_USER / MYSQL_PASSWORD / MYSQL_ROOT_PASSWORD
│   ├── statefulset.yaml   # mysql:8.4 + PVC via volumeClaimTemplates
│   └── service.yaml       # ClusterIP :3306
└── ingress.yaml           # routes invoices.local -> app service
```

## 1. Build and make the image available to your cluster

Docker Desktop's built-in Kubernetes shares the same Docker daemon as `docker build`,
so a locally built image is already visible to it — no registry push needed for that
setup. If you're using a different cluster (minikube, kind, a real registry, etc.),
push the image somewhere the cluster can pull it from instead.

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/kiii-invoices-app:latest .
docker push YOUR_DOCKERHUB_USERNAME/kiii-invoices-app:latest   # skip for Docker Desktop's own cluster
```

Then replace the `REPLACE_ME` placeholder in `k8s/app/deployment.yaml` and
`k8s/worker/deployment.yaml` with your actual image reference:

```bash
# bash
sed -i 's#REPLACE_ME/kiii-invoices-app#YOUR_DOCKERHUB_USERNAME/kiii-invoices-app#' k8s/app/deployment.yaml k8s/worker/deployment.yaml
```

```powershell
# PowerShell
(Get-Content k8s/app/deployment.yaml) -replace 'REPLACE_ME/kiii-invoices-app','YOUR_DOCKERHUB_USERNAME/kiii-invoices-app' | Set-Content k8s/app/deployment.yaml
(Get-Content k8s/worker/deployment.yaml) -replace 'REPLACE_ME/kiii-invoices-app','YOUR_DOCKERHUB_USERNAME/kiii-invoices-app' | Set-Content k8s/worker/deployment.yaml
```

If you're using Docker Desktop's own cluster with a locally built (unpushed) image,
also set `imagePullPolicy: Never` on both Deployments so Kubernetes doesn't try to
pull from a registry.

## 2. Apply the manifests

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -R -f k8s/
```

## 3. Check status

```bash
kubectl get all -n invoices
kubectl logs -n invoices deploy/app
kubectl logs -n invoices deploy/worker
```

Wait for `db-0`, `app-*`, and `worker-*` pods to show `Running`/`1/1 Ready` — the app
and worker both wait for MySQL and run migrations on startup, so give it 30-60s.

## 4. Access the app

**Via Ingress** (needs an ingress controller — install ingress-nginx if you don't
have one already: https://kubernetes.github.io/ingress-nginx/deploy/):

```bash
# Add to your hosts file: 127.0.0.1 invoices.local
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80
# then browse to http://invoices.local:8080
```

**Or skip the Ingress** and port-forward straight to the app service:

```bash
kubectl port-forward -n invoices svc/app 8080:80
# then browse to http://localhost:8080
```

## 5. Tear down

```bash
kubectl delete namespace invoices
```
